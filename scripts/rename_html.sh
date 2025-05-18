# Rename build/index.html to build/leaderboard.html
# Rename build/index_home.thml to build/index.html if it exists

# Make a copy of index.html before renaming
cp build/index.html build/leaderboard.html

# Check if index_home.html exists before moving it
if [ -f build/index_home.html ]; then
  mv build/index_home.html build/index.html
else
  # If index_home.html doesn't exist, keep the original index.html
  # Do nothing as we've already copied index.html to leaderboard.html
  echo "Keeping original index.html for GitHub Pages compatibility"
fi
