import { db } from "@/db/drizzle";
import { courseInvitation } from "@/db/schema/course-invitation";

const InvitationsPage = async () => {
  const query = await db.select().from(courseInvitation);

  return (
    <div>
      <h1>Invitations</h1>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Course ID</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {query.map((invitation) => (
            <tr key={invitation.id}>
              <td>{invitation.email}</td>
              <td>{invitation.courseId}</td>
              <td>{invitation.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvitationsPage;
