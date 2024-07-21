import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req, res) {
  console.log('Todos API route hit:', req.method);
  const { method } = req;

  switch (method) {
    case 'GET':
      await getTodosHandler(req, res);
      break;
    case 'POST':
      await saveTodoHandler(req, res);
      break;
    case 'PUT':
      await updateTodoHandler(req, res);
      break;
    case 'DELETE':
      await deleteTodoHandler(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const getTodosHandler = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT t.id, t.text, t.completed, 
             COALESCE(t.color, '#ff7b00') as color, 
             COALESCE(t.position, t.id) as position,
             json_agg(json_build_object('id', s.id, 'text', s.text, 'completed', s.completed)) as subtasks
      FROM public.todos t
      LEFT JOIN public.subtasks s ON t.id = s.todo_id
      WHERE t.email = $1
      GROUP BY t.id
      ORDER BY COALESCE(t.position, t.id)
    `, [email]);
    client.release();

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const saveTodoHandler = async (req, res) => {
  const { email, text, color = '#ff7b00' } = req.body;

  if (!email || !text) {
    return res.status(400).json({ error: 'Email and text are required' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO public.todos (email, text, completed, color, position) VALUES ($1, $2, $3, $4, (SELECT COALESCE(MAX(position), 0) + 1 FROM public.todos WHERE email = $1)) RETURNING id',
      [email, text, false, color]
    );
    client.release();
    res.status(200).json({ message: 'Todo saved successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Error saving todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTodoHandler = async (req, res) => {
  const { id, email, text, completed, color } = req.body;

  if (!id || !email) {
    return res.status(400).json({ error: 'Id and email are required' });
  }

  try {
    const client = await pool.connect();
    let query = 'UPDATE todos SET ';
    const updateFields = [];
    const values = [id, email];
    let paramCount = 3;

    if (text !== undefined) {
      updateFields.push(`text = $${paramCount}`);
      values.push(text);
      paramCount++;
    }
    if (completed !== undefined) {
      updateFields.push(`completed = $${paramCount}`);
      values.push(completed);
      paramCount++;
    }
    if (color !== undefined) {
      updateFields.push(`color = $${paramCount}`);
      values.push(color);
    }

    query += updateFields.join(', ') + ' WHERE id = $1 AND email = $2';
    
    await client.query(query, values);
    client.release();
    res.status(200).json({ message: 'Todo updated successfully' });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteTodoHandler = async (req, res) => {
  const { id, email } = req.body;

  if (!id || !email) {
    return res.status(400).json({ error: 'Id and email are required' });
  }

  try {
    const client = await pool.connect();
    await client.query('DELETE FROM subtasks WHERE todo_id = $1', [id]);
    await client.query('DELETE FROM todos WHERE id = $1 AND email = $2', [id, email]);
    client.release();
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};