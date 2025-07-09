import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.headers['x-user-id'] as string;
  const email = req.headers['x-user-email'] as string;
  const role = req.headers['x-user-role'] as string;
  const name = req.headers['x-user-name'] as string;

  // Check if the necessary user data exists in the headers
  if (!id || !email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.status(200).json({ id, email, role, name });
}
