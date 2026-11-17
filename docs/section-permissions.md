# Student section access

In /admin.html, every student's row includes five independent checkboxes: 基础法语, 听力训练, 阅读训练, 口语训练, 写作训练. Click 保存权限 to apply.

New students receive basic French only. Existing students without a permissions record retain their previous access to all sections. No existing account is automatically restricted during deployment. The teacher can lock preparation sections, review completion, and then manually unlock them. There is no automatic completion-based unlock.

Permissions are stored per student in the persistent SQLite database. Administrator accounts retain all access. Invalid permission fields and student attempts to change permissions are rejected. Account disabling continues to revoke all sessions.

The server filters lesson and exam data and bank indexes, and rejects locked question-set, image and audio URLs. Shared bank resources are accessible only if at least one of their associated permitted sections is open. Matching grammar-content modules are blocked when basics is closed. An already downloaded document cannot be withdrawn from a device. On subsequent navigation the app checks current permissions and reloads if changed; the server applies changes on every request.

Validation: scripts/check-section-permissions.mjs covers defaults, administrative role checks, malformed permissions, direct question/audio/image requests, filtering, revocation without re-login, persistence after restart and administrator access. Existing authentication/content checks also pass.
