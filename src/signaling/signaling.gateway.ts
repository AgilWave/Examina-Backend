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
import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'path';
import { ViolationsService } from '../violations/violations.service';

interface ExamRoom {
  examId: string;
  admin?: string;
  students: Set<string>;
}

interface ViolationRecord {
  timestamp: number;
  count: number;
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

  constructor(private readonly violationsService: ViolationsService) {}

  private rooms: Map<string, ExamRoom> = new Map();
  private socketToRoom: Map<string, string> = new Map();
  private socketRoles: Map<string, 'admin' | 'student'> = new Map();
  private socketToStudentId: Map<string, string> = new Map();
  private socketToStudentName: Map<string, string> = new Map();
  // Track recent violations to prevent duplicates within 3 seconds
  private recentViolations: Map<string, ViolationRecord> = new Map();

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

  @SubscribeMessage('screen-signal')
  handleScreenSignal(
    @MessageBody() data: { target: string; signalData: any },
    @ConnectedSocket() client: Socket,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { target, signalData } = data;
    console.log(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      `Screen signal from ${client.id} to ${target}: ${signalData.type}`,
    );

    // Forward the screen signal to the target
    this.server.to(target).emit('screen-signal', {
      sender: client.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      signalData,
    });
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
    @MessageBody()
    data: { examId: string; webcam: boolean; mic: boolean; screen?: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const { examId, webcam, mic, screen } = data;
    const room = this.rooms.get(examId);
    if (room && room.admin) {
      this.server.to(room.admin).emit('media-status', {
        sender: client.id,
        webcam,
        mic,
        screen: screen ?? false,
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
  async handleSecurityViolation(
    @MessageBody()
    data: {
      examId: string;
      studentId: string;
      violationType: string;
      count: number;
      socketId: string;
      timestamp?: number;
      webcamScreenshot?: string;
      screenScreenshot?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const {
      examId,
      studentId,
      violationType,
      count,
      socketId,
      timestamp,
      webcamScreenshot,
      screenScreenshot,
    } = data;

    // Create a unique key for this student and violation type
    const violationKey = `${studentId}-${examId}-${violationType}`;
    const currentTime = Date.now();
    const threeSecondsAgo = currentTime - 3000; // 3 seconds in milliseconds

    // Check if we have a recent violation of the same type
    const recentViolation = this.recentViolations.get(violationKey);
    if (recentViolation && recentViolation.timestamp > threeSecondsAgo) {
      console.log(
        `Ignoring duplicate ${violationType} violation from ${studentId} in exam ${examId} within 3-second window`,
      );
      return; // Skip this violation
    }

    this.recentViolations.set(violationKey, {
      timestamp: currentTime,
      count: count,
    });

    const fiveSecondsAgo = currentTime - 5000;
    for (const [key, record] of this.recentViolations.entries()) {
      if (record.timestamp < fiveSecondsAgo) {
        this.recentViolations.delete(key);
      }
    }

    const room = this.rooms.get(examId);
    console.log(
      `Session security violation from ${studentId} in exam ${examId}: ${violationType} (count: ${count})`,
    );
    let webCamPath = '';
    let screenPath = '';

    try {
      // Get the current working directory and ensure uploads directory exists
      const currentDir = process.cwd();

      // Ensure path module is available
      if (!path || typeof path.join !== 'function') {
        throw new Error('Path module is not available');
      }

      const uploadsDir = path.join(currentDir, 'uploads', 'violations');

      // Ensure the uploads directory exists
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (dirError) {
        console.error('Error creating uploads directory:', dirError);
        // Continue anyway, the specific subdirectories will be created later
      }

      if (webcamScreenshot) {
        // Validate base64 format
        if (!webcamScreenshot.includes(',')) {
          console.warn(
            'Invalid webcam screenshot format: missing base64 prefix',
          );
          return;
        }

        const webCamBuffer = Buffer.from(
          webcamScreenshot.split(',')[1],
          'base64',
        );

        // Use timestamp or fallback to current time
        const screenshotTimestamp = timestamp || Date.now();

        // Create the relative path for serving
        webCamPath = `/uploads/violations/${examId}/${studentId}/webcam_${screenshotTimestamp}.jpg`;

        // Create the full system path for saving
        const webCamFullPath = path.join(
          uploadsDir,
          examId,
          studentId,
          `webcam_${screenshotTimestamp}.jpg`,
        );

        // Ensure directory exists
        await mkdir(path.dirname(webCamFullPath), { recursive: true });
        await writeFile(webCamFullPath, webCamBuffer);
        // console.log(`Webcam screenshot saved to: ${webCamFullPath}`);
      }

      if (screenScreenshot) {
        // Validate base64 format
        if (!screenScreenshot.includes(',')) {
          console.warn(
            'Invalid screen screenshot format: missing base64 prefix',
          );
          return;
        }

        const screenBuffer = Buffer.from(
          screenScreenshot.split(',')[1],
          'base64',
        );

        // Use timestamp or fallback to current time
        const screenshotTimestamp = timestamp || Date.now();

        // Create the relative path for serving
        screenPath = `/uploads/violations/${examId}/${studentId}/screen_${screenshotTimestamp}.jpg`;

        // Create the full system path for saving
        const screenFullPath = path.join(
          uploadsDir,
          examId,
          studentId,
          `screen_${screenshotTimestamp}.jpg`,
        );

        // Ensure directory exists
        await mkdir(path.dirname(screenFullPath), { recursive: true });
        await writeFile(screenFullPath, screenBuffer);
        // console.log(`Screen screenshot saved to: ${screenFullPath}`);
      }
    } catch (error) {
      console.error('Error saving violation screenshots:', error);
      // Continue execution even if file saving fails
    }

    // Save violation to database
    try {
      await this.violationsService.create({
        examId: examId,
        studentId: studentId,
        violationType: violationType,
        count: count,
        socketId: socketId,
        violationTimestamp: timestamp
          ? new Date(timestamp).toISOString()
          : new Date().toISOString(),
        webcamScreenshotPath: webCamPath || undefined,
        screenScreenshotPath: screenPath || undefined,
        description: `${violationType} violation (count: ${count})`,
      });
      console.log(
        `Violation saved to database for student ${studentId} in exam ${examId}`,
      );
    } catch (dbError) {
      console.error('Error saving violation to database:', dbError);
      // Continue execution even if database save fails
    }

    if (room && room.admin) {
      // console.log(`Sending session-security-violation to admin ${room.admin}`);
      this.server.to(room.admin).emit('session-security-violation', {
        studentId,
        violationType,
        count,
        socketId: client.id,
      });
    }
  }
}
