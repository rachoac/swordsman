set -xe
cd client
npm run build
cd -

if [ ! -d target ]; then
	mkdir target
fi 

cp -R client/public/build/main.js target/public/build/.
