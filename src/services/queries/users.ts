import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { client } from '$services/redis';
import { usersKey, usernameUniqueKey, usernamesKey } from '$services/keys';

export const getUserByUsername = async (username: string) => {};

export const getUserById = async (id: string) => {
	const user = await client.hGetAll(usersKey(id));

	return deserialize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
	const id = genId();

	// See if the  username is already in the set of usernames
	const exists = await client.sIsMember(usernameUniqueKey(), attrs.username);
	// If so, throw and error
	if (exists) {
		throw new Error('Username is taken');
	}
	// Otherwise, continue

	await client.hSet(usersKey(id), serialize(attrs));
	await client.sAdd(usernameUniqueKey(), attrs.username);

	await client.zAdd(usernamesKey(), {
		value: attrs.username,
		score: parseInt(id, 16) //info: string to number conversion
	});

	return id;
};

const serialize = (user: CreateUserAttrs) => {
	return {
		username: user.username,
		password: user.password
	};
};

const deserialize = (id: string, user: { [key: string]: string }) => {
	return {
		id,
		username: user.username,
		password: user.password
	};
};
