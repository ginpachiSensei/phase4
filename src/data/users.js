import bcrypt from 'bcryptjs';

const Users = [
    {
        email: 'satyam@example.com',
        password: bcrypt.hashSync('123456',10),
    },
    {
        email: 'shivam@example.com',
        password: bcrypt.hashSync('123456',10),
    },
]

export default Users