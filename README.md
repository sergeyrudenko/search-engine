# Serch engine source code by Sergey Rudenko
You can change directory for scanning in main config module 

Install docker & docker-compose first
Project depends redis & rabbitmq and will be start with that containers

run 'docker-compose up --build' to build & run project in docker

After running project wait 10 sec for rabbitmq container started, 
after that project avalailable on localhost:6969

P.S. Ideally, project need separate by modules and run with microservices or logs inside the docker container:)
That solve problems, what i have with events, like pseudo sync requests to database.
