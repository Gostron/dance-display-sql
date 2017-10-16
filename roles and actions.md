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
- _CompetitionACL_
  - __C_PROGRESS__ : Changing progress
  - __C_MANAGEMENT__ : Creating objects
  - __C_JUDGE__ : Creating marks
  - __C_ADMIN__ : Assigning judges
  - __C_REFEREE__ : Consulting marks
- _GlobalACL_
  - __ADMIN__ : Admininstrator (no restrictions)
  - __HOST__ : Creating competitions, managing and granting permissions to competitions created by you.

Anonymous permissions grant reading on all objects but marks, which require __C_REFEREE__ permissions.

 Action                 |  Category   |                             API Call                          | Permission Required
----------------------- | :---------: | ------------------------------------------------------------- | -------------------
Grant globally          | Permissions | /grant/`userId`/_GlobalACL_                                   | __ADMIN__
Revoke globally         | Permissions | /revoke/`userId`/_GlobalACL_                                  | __ADMIN__
Grant in a competition  | Permissions | /competition/`id`/grant/`userId`/_CompetitionACL_             | __HOST__
Revoke in a competition | Permissions | /competition/`id`/revoke/`userId`/_CompetitionACL_            | __HOST__
Global object CRUD      |    CRUD     | /`object`                       <br>/new (__POST__) or /`id` (__GET__, __POST__ & __DELETE__)<br>where `object` is age, contestant, couple, dance, judge, stage, template or subtemplate | __ADMIN__
Competition object CRUD |    CRUD     | /competition/`id`/`object`      <br>/new (__POST__) or /`id` (__GET__, __POST__ & __DELETE__)<br>where `object` is category, event ou couple | __C_MANAGEMENT__
Judge competition CRUD  |    CRUD     | /competition/`id`/`judge`       <br>/new (__POST__) or /`id` (__GET__, __POST__ & __DELETE__) | __C_ADMIN__ for judge CRUD
Category object CRUD    |    CRUD     | /category/`id`/`object`         <br>/new (__POST__) or /`id` (__GET__, __POST__ & __DELETE__)<br>where `object` is stage ou couple | __C_MANAGEMENT__
Judge category CRUD     |    CRUD     | /category/`id`/stage/`id`/judge <br>/new (__POST__) or /`id` (__GET__, __POST__ & __DELETE__) | __C_ADMIN__
Mark CRUD               |    CRUD     | /category/`id`/stage/`id`/mark  <br>/new (__POST__) or /`id` (__GET__, __POST__ & __DELETE__) | __C_REFEREE__ for reading,<br>__C_JUDGE__ for CRUD
Progress CRUD           |    CRUD     | /competition/`id`/progress (__POST__) | __C_PROGRESS__