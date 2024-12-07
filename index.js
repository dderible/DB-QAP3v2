const express = require('express');
const app = express();
const PORT = 3000;
const { Pool } = require('pg');


app.use(express.json());

// PG connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'DBQAP3',
    password: 'password',
    port: 5432,
});

async function createTables() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                description TEXT NOT NULL,
                status TEXT NOT NULL
            )`);
        console.log('Table Successfully Created!');

    } catch (error) {
        console.error('ERROR: Table could not be created.', error);
    }
}

let tasks = [
    { id: 1, description: 'Buy groceries', status: 'incomplete' },
    { id: 2, description: 'Read a book', status: 'complete' },
];

// GET /tasks - Get all tasks
app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks');
        response.json(result.rows);
    }
    catch (error) {
        console.error(error);
        response.status(500).send('ERROR: Server not responding.');
    }
});

// POST /tasks - Add a new task
app.post('/tasks', async (request, response) => {
    const { description, status } = request.body;
    if (!description || !status) {
        return response.status(400).json({ error: 'All fields (description & status) are required' });
    }

    try {
        const result = await pool.query (
            `INSERT INTO tasks (description, status) VALUES ($1, $2) RETURNING *`,
            [description, status]
        );
        response.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error(error);
        response.status(500).send('Server error');
    }
});

// PUT /tasks/:id - Update a task's status
app.put('/tasks/:id', async (request, response) => {
    const taskId = parseInt(request.params.id, 10);
    const { status } = request.body;

    try{
        const result = await pool.query('UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *', [status, taskId]);
        if (result.rowCount === 0) {
            return response.status(404).send('Task not found');
        }
        response.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        response.status(500).send('ERROR: Server error');
    }
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', async (request, response) => {
    const taskId = parseInt(request.params.id, 10);
    try {
        const result = await pool.query(
            `DELETE FROM tasks WHERE id = $1 RETURNING *`,
            [taskId]
        );
        response.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        console.error(error);
        response.status(500).send('Server error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
