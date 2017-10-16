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

### Calls

 Action              |                             API Call                                            | Permission Required
-------------------- | ------------------------------------------------------------------------------- | -------------------
Object (global)      | `/object`                      <br>`/new` (POST) or `/:id` (GET, POST & DELETE)<br>where `object` is age, contestant, couple, dance, judge, stage, template or subtemplate | **ADMIN**
Progress             | `/competition/:id/progress` (POST)                                              | **C_PROGRESS**
Object (competition) | `/competition/:id/object`      <br>`/new` (POST) or `/:id` (GET, POST & DELETE)<br>where `object` is category, event ou couple | **C_MANAGEMENT**
Judge (competition)  | `/competition/:id/judge`       <br>`/new` (POST) or `/:id` (GET, POST & DELETE) | **C_ADMIN**
Object (category)    | `/category/:id/object`         <br>`/new` (POST) or `/:id` (GET, POST & DELETE)<br>where `object` is stage ou couple | **C_MANAGEMENT**
Judge (category)     | `/category/:id/stage/:id/judge`<br>`/new` (POST) or `/:id` (GET, POST & DELETE) | **C_ADMIN**
Mark                 | `/category/:id/stage/:id/mark` <br>`/new` (POST) or `/:id` (GET, POST & DELETE) | **C_REFEREE** (reading),<br>**C_JUDGE** (CRUD)
Grant (globally)     | `/grant/:userId/:GlobalACL`                                                     | **ADMIN**
Revoke (globally)    | `/revoke/:userId/:GlobalACL`                                                    | **ADMIN**
Grant (competition)  | `/competition/:id/grant/:userId/:CompetitionACL`                                | **HOST**
Revoke (competition) | `/competition/:id/revoke/:userId/:CompetitionACL`                               | **HOST**

### Objects associations

Some global objects can be created globally and in the context of a competition (in the competition directly, and/or in a category, and/or in a stage). This simply means that the object must be created globally (i.e. )