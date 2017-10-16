# Roles and actions

## Roles

Roles that interact with the model are defined to be :
- Contestant
- Admin
- Visitor
- Judge
- Organizer

## Role pyramid

Every level has his own actions (clearances) in addition with the layers under it

                                      -Top Admin-
                                  -----Organizer-----
                             ----Contestant-Judge-Help----
                        ----------------Visitor----------------

## Actions per role

### Top Admin
- Grant permissions of Organizer
- Create age, template, subtemplate, dance

### Organizer
Create competitions and manage them :
  - Grant permissions of judge, help
  - Create, modify and delete : categories, events, judges, contestants, stages
  - Handle progress

### Help
- Subpackage (decided par Organizer) of his own actions

### Judge
- Create, modify and delete marks

### Contestant
- Subscribe to a competition
- Subscribe to categories
- Check the conduct
- Create a couple

### Visitor
- Check basic data

## API Calls per action

### Calls

 Action              |                             API Call                                            | Permission Required
-------------------- | ------------------------------------------------------------------------------- | -------------------
Object (global)      | `/object`                      <br>`/new` (POST) or `/:id` (GET, POST & DELETE)<br>where `object` is age, contestant, couple, dance, judge, stage, template or subtemplate | **ADMIN**
Object (global)      | `/competition`                 <br>`/new` (POST) or `/:id` (GET, POST & DELETE) | **HOST**
Object (competition) | `/competition/:id/object`      <br>`/new` (POST) or `/:id` (GET, POST & DELETE)<br>where `object` is category, event or couple | **C_MANAGEMENT**
Judge (competition)  | `/competition/:id/judge`       <br>`/new` (POST) or `/:id` (GET, POST & DELETE) | **C_ADMIN**
Progress             | `/competition/:id/progress` (POST)                                              | **C_PROGRESS**
Object (category)    | `/category/:id/object`         <br>`/new` (POST) or `/:id` (GET, POST & DELETE)<br>where `object` is stage or couple | **C_MANAGEMENT**
Judge (category)     | `/category/:id/stage/:id/judge`<br>`/new` (POST) or `/:id` (GET, POST & DELETE) | **C_ADMIN**
Mark                 | `/category/:id/stage/:id/mark` <br>`/new` (POST) or `/:id` (GET, POST & DELETE) | **C_REFEREE** (reading),<br>**C_JUDGE** (CRUD)
Grant (globally)     | `/grant/:userId/:GlobalACL`                                                     | **ADMIN**
Revoke (globally)    | `/revoke/:userId/:GlobalACL`                                                    | **ADMIN**
Grant (competition)  | `/competition/:id/grant/:userId/:CompetitionACL`                                | **HOST**
Revoke (competition) | `/competition/:id/revoke/:userId/:CompetitionACL`                               | **HOST**

### Permissions types

Permissions are enumerators with the following values:
- *CompetitionACL*
  - __C_PROGRESS__ : Changing progress
  - __C_MANAGEMENT__ : Creating objects
  - __C_JUDGE__ : Creating marks
  - __C_ADMIN__ : Assigning judges
  - __C_REFEREE__ : Consulting marks
- *GlobalACL*
  - __ADMIN__ : Admininstrator (no restrictions)
  - __HOST__ : Creating competitions, managing and granting permissions to competitions created by you.

Anonymous permissions grant reading on all objects but marks, which require __C_REFEREE__ permissions.

### Objects associations

Some objects can be created globally and in the context of a competition (in the competition directly, and/or in a category, and/or in a stage).
This means that the object must be created globally (i.e. a couple), and then associated with a competition (i.e. the couple has subscribed to the event, has a competition number), and then associated with a round (i.e our couple will dance in the third category up to the semi-finals). This allows for no duplication of data and a simplified user management (the same couple will have the same credentials, and will be recognized across competitions).

### Extended mode

The extended mode is activated through the addition of the URL parameter `extended=true` and is available on most **GET** API calls, where applicable.
What it does is that it returns the value with all of the references to the object.
For example, if you request a certain competition, the standard call (non-extended) will return the object in its simple form : date_begin, date_end, name and subname.
If you request it with the extended mode (`/competition/4?extended=true`), you will get the (most) complete version of the object : previous properties + progress + a list of categories, events, judges, couples that have been associated with the competition. The categories returned, however, won't be extended, which means they will not show their own stages or couples. The other references will not be extended either.