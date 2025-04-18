import type { Session } from '$services/types';
import { sessionsKey } from '$services/keys';
import { client } from '$services/redis';

export const getSession = async (id: string) => {
	const session = await client.hGetAll(sessionsKey(id));

	console.log(session);

	return session;
};

export const saveSession = async (session: Session) => {};
