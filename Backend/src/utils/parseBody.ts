export const parseBody = (body: string | null): any => {
  try {
    return typeof body === 'string' ? JSON.parse(body) : {};
  } catch {
    return {};
  }
};
