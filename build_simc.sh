# credits: based on https://github.com/SimCMinMax/AutoSimC/blob/master/launch-ubuntu.sh 

echo "Downloading Simc source code to ~/tmp/simc-source building it and installing it in ~/bin/simc"
mkdir -p ~/tmp/simc-source
rm ~/tmp/simc-source/* -r #delete current content of the tmp folder
cd ~/tmp/simc-source


default_branch=$(curl -s https://api.github.com/repos/simulationcraft/simc | sed -n 's/.*"default_branch": "\(.*\)",/\1/p') # could force 'jq' to be installed, but rather not do that to people.
wget https://github.com/simulationcraft/simc/zipball/${default_branch}

#compile
echo "Extracting the source code.."
unzip $default_branch
rm $default_branch

echo "Compiling simc"
cd *simc*/engine
make OPENSSL=1 optimized # build from source

rm ~/bin/simc # remove the old binary
mkdir -p ~/bin # create the bin folder if it doesn't exist
mv simc ~/bin/simc # move the binary to the bin folder

rm -r ~/tmp/simc-source # remove the source code

echo "Done! simc is now installed in ~/bin/simc"