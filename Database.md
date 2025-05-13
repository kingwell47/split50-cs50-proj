## Firestore Database Structure

### `users` Collection

- **Document ID**: `uid` (Firebase Auth UID)
- **Fields**:
  - `displayName` (string)
  - `email` (string)
  - `photoURL` (string)
  - `createdAt` (Timestamp)

### `groups` Collection

- **Document ID**: auto-generated `groupId`
- **Fields**:
  - `name` (string)
  - `description` (string)
  - `createdBy` (string, uid)
  - `createdAt` (Timestamp)

#### Subcollection: `members`

- **Path**: `groups/{groupId}/members`
- **Document ID**: member’s `uid`
- **Fields**:
  - `role` (`"admin"` | `"member"`)
  - `joinedAt` (Timestamp)
  - `invitedBy` (string, uid)

#### Subcollection: `expenses`

- **Path**: `groups/{groupId}/expenses`
- **Document ID**: auto-generated `expenseId`
- **Fields**:
  - `description` (string)
  - `amount` (number)
  - `date` (Timestamp)
  - `createdBy` (string, uid)
  - `category` (string)
  - `participants` (array\<string\>) — list of user UIDs
  - `splits` (array\<object\>)
    - each split:
      - `userId` (string)
      - `amount` (number)

### `invitations` Collection

- **Document ID**: auto-generated `invitationId`
- **Fields**:
  - `groupId` (string)
  - `inviteeEmail?` (string)
  - `inviteeUid?` (string)
  - `inviterUid` (string)
  - `status` (`"pending"` | `"accepted"` | `"declined"`)
  - `createdAt` (Timestamp)
