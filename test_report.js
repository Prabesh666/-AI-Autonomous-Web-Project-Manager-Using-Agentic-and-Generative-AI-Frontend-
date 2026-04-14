import axios from 'axios';

async function test() {
    try {
        const loginRes = await axios.post('http://localhost:5001/api/v1/auth/login', {
            email: 'admin@system.local',
            password: 'password123'
        });
        const token = loginRes.data.data.token || loginRes.data.token;

        const projRes = await axios.get('http://localhost:5001/api/v1/projects', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const project = projRes.data.data.projects ? projRes.data.data.projects[0] : projRes.data.data[0];

        if (!project) return console.log("No project");

        const res = await axios.post('http://localhost:5001/api/v1/reports', {
            project: project._id || project.id,
            title: "Test Report Script",
            content: "This is a test."
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("POST RESULT:", res.data);
    } catch (err) {
        console.error("ERROR:");
        if (err.response) {
            console.error(err.response.status, err.response.data);
        } else {
            console.error(err.message);
        }
    }
}
test();
