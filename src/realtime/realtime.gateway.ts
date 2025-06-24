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
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-environment-check')
  async handleJoinEnvironmentCheck(
    @MessageBody() data: { examId: string; studentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = `env-check-${data.examId}-${data.studentId}`;
    await client.join(roomId);

    console.log(`Desktop joined room: ${roomId}`);

    client.emit('joined-environment-check', {
      success: true,
      roomId,
      message: 'Waiting for mobile completion...',
    });
  }

  @SubscribeMessage('environment-check-completed')
  handleEnvironmentCheckCompleted(
    @MessageBody()
    data: {
      examId: string;
      studentId: string;
      videoUrl: string;
      uploadId: string;
    },
  ) {
    const roomId = `env-check-${data.examId}-${data.studentId}`;

    console.log(`Environment check completed for room: ${roomId}`);

    // Notify all clients in the room (desktop waiting)
    this.server.to(roomId).emit('environment-check-done', {
      success: true,
      completed: true,
      videoUrl: data.videoUrl,
      uploadId: data.uploadId,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('environment-check-progress')
  handleEnvironmentCheckProgress(
    @MessageBody() data: { examId: string; studentId: string; status: string },
  ) {
    const roomId = `env-check-${data.examId}-${data.studentId}`;
    this.server.to(roomId).emit('environment-check-progress', {
      status: data.status,
      timestamp: new Date().toISOString(),
    });
  }
}
