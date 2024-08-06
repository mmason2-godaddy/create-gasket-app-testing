cd __apps__

for d in */ ; do
    echo "Building $d"
    cd $d
    npm run build
    cd ..
done

exit;
