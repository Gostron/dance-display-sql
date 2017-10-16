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

Action | API Calls
------ | ---------
Grant permission | /api/competition/_:id_/grant/_:userId_/_:permissionType_<br>/api/user/_:userId_/grant/_:permissionType_
Create object | /api/age/new (__POST__)<br>/api/category/_:id_/stage/new (__POST__)<br>/api/competition/new (__POST__)<br>/api/competition/_:id_/category/new (__POST__)<br>/api/competition/_:id_/event/new (__POST__)<br>/api/contestant/new (__POST__)<br>/api/couple/new (__POST__)<br>/api/dance/new (__POST__)<br>/api/judge/new (__POST__)<br>/api/mark/new (__POST__)<br>/api/stage/new (__POST__)<br>/api/subtemplate/new (__POST__)<br>/api/template/new (__POST__)
Update or<br>delete object | /api/age/_:id_ (__POST__ & __DELETE__)<br>/api/category/_:id_ (__POST__ & __DELETE__)<br>/api/competition/_:id_ (__POST__ & __DELETE__)<br>__/api/competition/_:id_/progress__ (__POST__)<br>/api/contestant/_:id_ (__POST__ & __DELETE__)<br>/api/couple/_:id_ (__POST__ & __DELETE__)<br>/api/dance/_:id_ (__POST__ & __DELETE__)<br>/api/event/_:id_ (__POST__ & __DELETE__)<br>/api/judge/_:id_ (__POST__ & __DELETE__)<br>/api/mark/_:id_ (__POST__ & __DELETE__)<br>/api/stage/_:id_ (__POST__ & __DELETE__)<br>/api/subtemplate/_:id_ (__POST__ & __DELETE__)<br>/api/template/_:id_ (__POST__ & __DELETE__)
Associate objects,<br>update association (if it exists)<br> or delete association | /api/category/_:id_/couple/_:id_ (__POST__ & __DELETE__)<br>/api/category/_:id_/judge/_:id_ (__POST__ & __DELETE__)<br>/api/category/_:id_/stage/_:id_ (__POST__ & __DELETE__)<br>/api/competition/_:id_/couple/_:id_ (__POST__ & __DELETE__)
