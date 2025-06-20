import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'exams',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class ExamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-exam')
  async handleJoinExam(
    @MessageBody() data: { examId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const examRoom = `exam-${data.examId}`;
    try {
      await client.join(examRoom);

      const clients = await this.server.in(examRoom).fetchSockets();
      const otherClientIds = clients
        .filter((socket) => socket.id !== client.id)
        .map((socket) => socket.id);

      client.emit('existing-users', { users: otherClientIds });

      client.to(examRoom).emit('user-joined', {
        id: client.id,
        examId: data.examId,
        message: `A new user has joined exam ${data.examId}`,
      });
      console.log(`Client ${client.id} joined exam ${data.examId}`);
    } catch (error) {
      console.error(`Error joining exam ${data.examId}:`, error);
    }
  }

  @SubscribeMessage('signal')
  handleSignal(
    @MessageBody() payload: { target: string; signalData: any },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(payload.target).emit('signal', {
      sender: client.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      signalData: payload.signalData,
    });
  }

  @WebSocketServer()
  server: Server;
}
