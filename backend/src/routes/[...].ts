export default eventHandler((event) => {
	const { url } = event.req;
	throw createError({
		statusCode: 404,
		name: "not found",
		message: `${url} not found`,
		statusMessage: "Route not Found",
	});
});
