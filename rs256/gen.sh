ssh-keygen -t rsa -b 2048 -m PEM -f private.key
openssl rsa -in private.key -pubout -outform PEM -out public.key