### Q: Что может делать бот? Зачем он?
### A: Бот может управлять блогами в вашей гильдии. Он сделан для опыта работы с базой данных PostgreSQL.

## Установка бота
1. Установите необходимые модули.
```shell
$ npm i
```

2. Создайте базу данных.
```shell
$ CREATE DATABASE shika-blogs;
```
3. Подключитесь к базе данных. 
```shell
$ \connect shika-blogs;
```
4. Создайте таблицы, они находятся [тут](https://github.com/Redume/shika-blogs/tree/main/data/schema.js)

5. Запустите бота.
```shell
$ node .
```

## Лицензия
    Copyright 2022 Redume
    
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
    http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.