set -xe
export GOPATH=`pwd`/service
cd service/src/swordsman
glide install
go build -v
cd -

if [ ! -d target ]; then
	mkdir target
fi

cp -f service/src/swordsman/swordsman target/.

