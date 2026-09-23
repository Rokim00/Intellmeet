export interface ServerToClientEvents {
  notification: (data: { message: string; timestamp: string }) => void;
}

export interface ClientToServerEvents {
  ping: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
}
