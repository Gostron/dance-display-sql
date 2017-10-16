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
- Competition permissions
  - __C_PROGRESS__ : Changing progress
  - __C_MANAGEMENT__ : Creating objects
  - __C_JUDGE__ : Creating marks
  - __C_ADMIN__ : Assigning judges
  - __C_REFEREE__ : Consulting marks
- Global permissions
  - __ADMIN__ : Admininstrator (no restrictions)
  - __HOST__ : Creating competitions, managing and granting permissions to competitions created by you.

Action | Category | API Call | Permission Required
------ | -------- | -------- | -------------------
Grant in a competition scope        | Permissions                 | /api/competition/_:id_/grant/_:userId_/_:CompetitionPermissionType_   | __HOST__
Revoke in a competition scope       | Permissions                 | /api/competition/_:id_/revoke/_:userId_/_:CompetitionPermissionType_  | __HOST__
Grant globally                      | Permissions                 | /api/grant/_:userId_/_:permissionType_                                | __ADMIN__
Revoke globally                     | Permissions                 | /api/revoke/_:userId_/_:permissionType_                               | __ADMIN__
Create a new global object          | Global object CRUD          | /api/`object`/new (__POST__)<br>/api/`object`/_:id_ (__GET__, __POST__ & __DELETE__)<br>Objects are : age, contestant, couple, dance, judge, stage, template, subtemplate | __ADMIN__
Create a new competition object     | Competition object CRUD     | /api/competition/_:id_/`object`/new (__POST__)<br>/api/`object`/_:id_ (__GET__, __POST__ & __DELETE__)<br>Objects are : category, event, progress (can only be updated), couple | __C_MANAGEMENT__ or __C_PROGRESS__ for progress
Create a new category object        | Category object CRUD        | /api/category/_:id_/`object`/new (__POST__)<br>/api/`object`/_:id_ (__GET__, __POST__ & __DELETE__)<br>Objects are : stage, couple, judge | __C_MANAGEMENT__ and __C_ADMIN__ for judge C~~R~~UD
Create a new mark                   | Mark CRUD                   | /api/category/_:id_/stage/_:id_/`mark`/new (__POST__)<br>/category/_:id_/stage/_:id_/`mark`/_:id_ (__GET__, __POST__ & __DELETE__) | __C_JUDGE__ for CRUD and __C_REFEREE__ for reading