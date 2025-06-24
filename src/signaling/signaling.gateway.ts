import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ExamRoom {
  examId: string;
  admin?: string;
  students: Set<string>;
}

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'https://examina.live',
      'https://admin.examina.live',
    ],
    methods: ['GET', 'POST'],
  },
  transports: ['websocket'],
})
export class SignalingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private rooms: Map<string, ExamRoom> = new Map();
  private socketToRoom: Map<string, string> = new Map();
  private socketRoles: Map<string, 'admin' | 'student'> = new Map();
  private socketToStudentId: Map<string, string> = new Map();
  private socketToStudentName: Map<string, string> = new Map();

  private updateStudentSocketId(
    studentId: string,
    newSocketId: string,
    examId: string,
  ) {
    // Find the old socket ID for this studentId
    let oldSocketId: string | undefined;
    for (const [socketId, sId] of this.socketToStudentId.entries()) {
      if (sId === studentId) {
        oldSocketId = socketId;
        break;
      }
    }
    if (oldSocketId && oldSocketId !== newSocketId) {
      // Remove old socket references
      this.socketToRoom.delete(oldSocketId);
      this.socketRoles.delete(oldSocketId);
      this.socketToStudentId.delete(oldSocketId);
      this.socketToStudentName.delete(oldSocketId);

      // Remove from room
      const room = this.rooms.get(examId);
      if (room) {
        room.students.delete(oldSocketId);
        room.students.add(newSocketId);
      }
    }
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const examId = this.socketToRoom.get(client.id);
    const role = this.socketRoles.get(client.id);

    if (examId && role) {
      const room = this.rooms.get(examId);
      if (room) {
        if (role === 'admin') {
          room.admin = undefined;
        } else {
          room.students.delete(client.id);
          const studentId = this.socketToStudentId.get(client.id);
          // Notify admin that student left
          if (room.admin) {
            this.server
              .to(room.admin)
              .emit('user-left', { id: client.id, studentId: studentId });
          }
          // Notify other students
          room.students.forEach((studentId) => {
            this.server
              .to(studentId)
              .emit('user-left', { id: client.id, studentId: studentId });
          });
        }

        // Clean up empty rooms
        if (!room.admin && room.students.size === 0) {
          this.rooms.delete(examId);
        }
      }
    }

    this.socketToRoom.delete(client.id);
    this.socketRoles.delete(client.id);
    this.socketToStudentId.delete(client.id);
  }

  @SubscribeMessage('join-exam')
  async handleJoinExam(
    @MessageBody()
    data: {
      examId: string;
      role?: 'admin' | 'student';
      studentId?: string;
      studentName?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { examId, role = 'student', studentId, studentName } = data;

    console.log(`${role} ${client.id} joining exam ${examId}`);

    let room = this.rooms.get(examId);
    if (!room) {
      room = {
        examId,
        admin: undefined,
        students: new Set(),
      };
      this.rooms.set(examId, room);
    }

    // If student is rejoining, update their socket ID
    if (role === 'student' && studentId) {
      this.updateStudentSocketId(studentId, client.id, examId);
    }

    // Store mappings
    this.socketToRoom.set(client.id, examId);
    this.socketRoles.set(client.id, role);
    if (studentId) {
      this.socketToStudentId.set(client.id, studentId);
    }
    if (studentName) {
      this.socketToStudentName.set(client.id, studentName);
    }

    // Join the socket.io room
    await client.join(examId);

    if (role === 'admin') {
      room.admin = client.id;

      // Send existing students to admin
      const existingUsers = Array.from(room.students);
      if (existingUsers.length > 0) {
        const usersWithStudentIds = existingUsers.map((socketId) => ({
          id: socketId,
          studentId: this.socketToStudentId.get(socketId),
          studentName: this.socketToStudentName.get(socketId),
        }));

        client.emit('existing-users', { users: usersWithStudentIds });

        // Request media status from all students
        existingUsers.forEach((socketId) => {
          this.server
            .to(socketId)
            .emit('request-media-status', { adminId: client.id });
        });
      }
    } else {
      room.students.add(client.id);

      // Notify admin about new student
      if (room.admin) {
        this.server.to(room.admin).emit('user-joined', {
          id: client.id,
          studentId: this.socketToStudentId.get(client.id),
          studentName: this.socketToStudentName.get(client.id),
        });
      }
      // send admin id to student
      if (room.admin) {
        console.log(`Sending admin id to student ${client.id}: ${room.admin}`);
        client.emit('admin-info', { adminId: room.admin });
      }

      // Send existing students to new student (for peer-to-peer connections)
      const existingStudents = Array.from(room.students).filter(
        (id) => id !== client.id,
      );
      if (existingStudents.length > 0) {
        client.emit('existing-users', { users: existingStudents });
      }

      // Notify existing students about new student
      existingStudents.forEach((studentId) => {
        this.server
          .to(studentId)
          .emit('user-joined', { id: client.id, studentId: studentId });
      });
    }

    console.log(
      `Room ${examId} - Admin: ${room.admin ? 'Yes' : 'No'}, Students: ${room.students.size}`,
    );
  }

  @SubscribeMessage('signal')
  handleSignal(
    @MessageBody() data: { target: string; signalData: any },
    @ConnectedSocket() client: Socket,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { target, signalData } = data;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log(`Signal from ${client.id} to ${target}: ${signalData.type}`);

    // Forward the signal to the target
    this.server.to(target).emit('signal', {
      sender: client.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      signalData,
    });
  }

  @SubscribeMessage('private-message')
  handlePrivateMessage(
    @MessageBody()
    data: { to: string; from: string; message: string; participantId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(
      `Private message from ${data.from} to ${data.to}: ${data.message}`,
    );
    // Forward the message to the target socket
    this.server.to(data.to).emit('private-message', {
      sender: client.id,
      from: data.from,
      message: data.message,
      participantId: data.participantId,
      studentName: this.socketToStudentName.get(client.id),
      studentId: this.socketToStudentId.get(client.id),
    });
  }

  @SubscribeMessage('student-help-request')
  handleStudentHelpRequest(
    @MessageBody() data: { from: string; examId: string },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms.get(data.examId);
    if (room && room.admin) {
      this.server
        .to(room.admin)
        .emit('student-help-request', { from: data.from });
    }
  }

  @SubscribeMessage('voice-connect-request')
  handleVoiceConnectRequest(
    @MessageBody() data: { to: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Forward the request to the student
    this.server.to(data.to).emit('voice-connect-request', { from: client.id });
  }

  @SubscribeMessage('voice-signal')
  handleVoiceSignal(
    @MessageBody() data: { target: string; signalData: any },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.target).emit('voice-signal', {
      sender: client.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      signalData: data.signalData,
    });
  }

  @SubscribeMessage('voice-disconnect')
  handleVoiceDisconnect(
    @MessageBody() data: { to: string },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.to).emit('voice-disconnect');
  }

  @SubscribeMessage('media-status')
  handleMediaStatus(
    @MessageBody() data: { examId: string; webcam: boolean; mic: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const { examId, webcam, mic } = data;
    const room = this.rooms.get(examId);
    if (room && room.admin) {
      this.server.to(room.admin).emit('media-status', {
        sender: client.id,
        webcam,
        mic,
        examId,
      });
    }
  }

  @SubscribeMessage('get-room-info')
  handleGetRoomInfo(
    @MessageBody() data: { examId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms.get(data.examId);
    if (room) {
      client.emit('room-info', {
        examId: data.examId,
        hasAdmin: !!room.admin,
        studentCount: room.students.size,
        students: Array.from(room.students),
      });
    } else {
      client.emit('room-info', {
        examId: data.examId,
        hasAdmin: false,
        studentCount: 0,
        students: [],
      });
    }
  }

  @SubscribeMessage('session-security-violation')
  handleSecurityViolation(
    @MessageBody()
    data: {
      examId: string;
      studentId: string;
      violationType: string;
      count: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { examId, studentId, violationType, count } = data;
    const room = this.rooms.get(examId);
    console.log(
      `Session security violation from ${studentId} in exam ${examId}: ${violationType} (count: ${count})`,
    );
    if (room && room.admin) {
      console.log(`Sending student-security-violation to admin ${room.admin}`);
      this.server.to(room.admin).emit('student-security-violation', {
        studentId,
        violationType,
        count,
        socketId: client.id,
      });
    }
  }
}
