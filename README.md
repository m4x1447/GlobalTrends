# GlobalTrends

For å oppdatere python requirements.txt, kjør:
pip freeze > requirements.txt

## Docker

 

## For å bygge container
 docker build . -t globaltrends.azurecr.io/globaldocker:test

## For å teste lokalt om container kan kjøre
 docker run --rm -p 5000:5000 globaltrends.azurecr.io/globaldocker:test

 # Ny version: (husk å start Rancher Dekstop)
 ## For å logge inn på container registy
 docker login -u GlobalTrends -p passowrd globaltrends.azurecr.io
 ## For å bygge + pushe container til registry(husk å logge inn først)
 docker build . -t globaltrends.azurecr.io/globaldocker:SKRIV_VERSION_HER --push

 I azure, 