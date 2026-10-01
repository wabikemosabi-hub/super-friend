const usernamePattern = /^[a-zA-Z0-9_]{3,24}$/;

export function usernameProblem(username: string): string | null {
  return usernamePattern.test(username)
    ? null
    : 'Usernames are 3 to 24 letters, numbers or underscores';
}
