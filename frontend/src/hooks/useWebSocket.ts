import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';

interface Notificacao {
    pedidoId: number;
    status: string;
    mensagem: string;
}

export function useWebSocket(usuarioId: number | null, onNotificacao: (n: Notificacao) => void) {
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!usuarioId) return;

        const client = new Client({
brokerURL: 'wss://grize-fast-food-production.up.railway.app/ws',           onConnect: () => {
                client.subscribe(`/topic/pedidos/${usuarioId}`, (message) => {
                    const notificacao: Notificacao = JSON.parse(message.body);
                    onNotificacao(notificacao);
                });
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [usuarioId, onNotificacao]);
}