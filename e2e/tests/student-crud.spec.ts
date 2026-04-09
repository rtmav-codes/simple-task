import { test, expect } from '@playwright/test';

test.describe('Student CRUD API Integrations', () => {
  test('Should chronologically validate backend developer challenge endpoints', async ({ request }) => {
    
    // Step 0. Login to retrieve the authorization cookies and CSRF
    const loginRes = await request.post('http://localhost:5007/api/v1/auth/login', {
      data: { username: 'admin@school-admin.com', password: '3OU4zn3q6Zh9'}
    });
    expect(loginRes.status()).toBe(200);
    
    // Extract CSRF Token to fulfill security policies on subsequent POST/PUT/DELETE
    const cookiesStr = loginRes.headers()['set-cookie'] || '';
    const csrfMatch = cookiesStr.match(/csrfToken=([^;\n]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';
    const headers = { 'x-csrf-token': csrfToken };

    // Step 1. CREATE Student via API Requirement
    const mailId = Date.now();
    const createRes = await request.post('http://localhost:5007/api/v1/students', {
      headers,
      data: {
        name: 'Automated Playwright Student',
        email: `e2e_${mailId}@test.com`,
        gender: "Male",
        phone: "1234567890",
        dob: "2010-01-01",
        admissionDate: "2024-01-01",
        roll: 1234
      }
    });
    expect(createRes.status()).toBe(200);

    // Step 2. READ ALL Students
    const readAllRes = await request.get('http://localhost:5007/api/v1/students', { headers });
    expect(readAllRes.status()).toBe(200);
    const readAllData = await readAllRes.json();
    
    // Locate the student ID we just seeded
    const newStudent = readAllData.students.find((s: any) => s.email === `e2e_${mailId}@test.com`);
    expect(newStudent).toBeDefined();
    const studentId = newStudent.id;

    // Step 3. READ ONE Student
    const readOneRes = await request.get(`http://localhost:5007/api/v1/students/${studentId}`, { headers });
    expect(readOneRes.status()).toBe(200);
    
    // Step 4. UPDATE Student
    const updateRes = await request.put(`http://localhost:5007/api/v1/students/${studentId}`, {
      headers,
      data: {
        ...newStudent,
        userId: studentId,
        name: 'Updated Automata Student'
      }
    });
    expect(updateRes.status()).toBe(200);
    
    // Step 5. UPDATE Status Endpoint Configuration
    const statusRes = await request.post(`http://localhost:5007/api/v1/students/${studentId}/status`, {
      headers,
      data: { status: false }
    });
    expect(statusRes.status()).toBe(200);

    // Step 6. DELETE Student (Targeting the custom route we implemented!)
    const deleteRes = await request.delete(`http://localhost:5007/api/v1/students/${studentId}`, { headers });
    expect(deleteRes.status()).toBe(200);
    
  });
});
