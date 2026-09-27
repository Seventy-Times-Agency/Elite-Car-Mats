// Stand-in for the "server-only" marker package in unit tests: the real
// module throws outside a server bundle, and the modules under test are
// pure functions that merely live in server-only files.
export {};
