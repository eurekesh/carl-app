CREATE DATABASE creative_art_live; 

CREATE TABLE canvases (
    canvasID int NOT NULL PRIMARY KEY,
    64bitcode varchar(max),
    group_name varchar(200),
    assigned_noun varchar(200),
    date_created date,
    ratings int[]
);

CREATE TABLE userInfo (
    group_name varchar(200),
    player_names text[]
);
