<details>
<summary>

### Установка бота

</summary>

#### Для установки нужен минимум NodeJS 16.9.0, а так же рекомендуется использовать PostgreSQL 14.4

1. Установите необходимые модули.
```shell
$ npm i
```

2. Зайдите в пользователя базы данных PostgreSQL.
```shell
$ psql -U <DATABASE_USERNAME>
```

3. Создайте базу данных.
```shell
$ CREATE DATABASE <DATABASE_NAME>;
```

4. Подключитесь к базе данных. 
```shell
$ \connect <DATABASE_NAME>;
```

5. Создайте таблицы, они находятся [тут](https://github.com/Redume/shika-blogs/blob/main/data/schema.sql)

6. Запустите бота.
```shell
$ node .
```

</details>

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
