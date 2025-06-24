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
          // Notify admin that student left
          if (room.admin) {
            this.server.to(room.admin).emit('user-left', { id: client.id });
          }
          // Notify other students
          room.students.forEach((studentId) => {
            this.server.to(studentId).emit('user-left', { id: client.id });
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
  }

  @SubscribeMessage('join-exam')
  async handleJoinExam(
    @MessageBody() data: { examId: string; role?: 'admin' | 'student' },
    @ConnectedSocket() client: Socket,
  ) {
    const { examId, role = 'student' } = data;

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

    // Store mappings
    this.socketToRoom.set(client.id, examId);
    this.socketRoles.set(client.id, role);

    // Join the socket.io room
    await client.join(examId);

    if (role === 'admin') {
      room.admin = client.id;

      // Send existing students to admin
      const existingUsers = Array.from(room.students);
      if (existingUsers.length > 0) {
        client.emit('existing-users', { users: existingUsers });
        // Request media status from all students
        existingUsers.forEach((studentId) => {
          this.server
            .to(studentId)
            .emit('request-media-status', { adminId: client.id });
        });
      }
    } else {
      room.students.add(client.id);

      // Notify admin about new student
      if (room.admin) {
        this.server.to(room.admin).emit('user-joined', { id: client.id });
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
        this.server.to(studentId).emit('user-joined', { id: client.id });
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
}
