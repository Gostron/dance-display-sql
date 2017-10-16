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

Anonymous permissions grant reading on all objects but marks, which require __C_REFEREE__ permissions.

 Action                 |  Category   |                             API Call                                  | Permission Required
----------------------- | ----------- | --------------------------------------------------------------------- | -------------------
Grant in a competition  | Permissions | /competition/`id`/grant/`userId`/_CompetitionPermissionType_   | __HOST__
Revoke in a competition | Permissions | /competition/`id`/revoke/`userId`/_CompetitionPermissionType_  | __HOST__
Grant globally          | Permissions | /grant/`userId`/_GlobalPermissionType_                          | __ADMIN__
Revoke globally         | Permissions | /revoke/`userId`/_GlobalPermissionType_                         | __ADMIN__
Global object CRUD      | Object CRUD | /`object`/new (__POST__)<br>/`object`/`id` (__GET__, __POST__ & __DELETE__)<br>where `object` is age, contestant, couple, dance, judge, stage, template or subtemplate | __ADMIN__
Competition object CRUD | Object CRUD | /api/competition/`id`/`object`/new (__POST__)<br>/api/`object`/`id` (__GET__, __POST__ & __DELETE__)<br>where `object` is category, event, couple or judge | __C_MANAGEMENT__ and __C_ADMIN__ for judge C~~R~~UD
Category object CRUD    | Object CRUD | /api/category/`id`/`object`/new (__POST__)<br>/api/`object`/`id` (__GET__, __POST__ & __DELETE__)<br>where `object` is stage, couple or judge | __C_MANAGEMENT__ and __C_ADMIN__ for judge C~~R~~UD
Judges CRUD             | Object CRUD | /api/category/`id`/stage/`id`/judge/new (__POST__)<br>/api/category/`id`/stage/`id`/judge/`id` (__GET__, __POST__ & __DELETE__)<br>where `object` is stage, couple or judge | __C_MANAGEMENT__ and __C_ADMIN__ for judge C~~R~~UD
Mark CRUD               | Object CRUD | /api/category/`id`/stage/`id`/mark/new (__POST__)<br>/api/category/`id`/stage/`id`/mark/`id` (__GET__, __POST__ & __DELETE__) | __C_JUDGE__ for CRUD and __C_REFEREE__ for reading
Progress CRUD           | Object CRUD | /api/competition/`id`/progress (__POST__) | __C_PROGRESS__