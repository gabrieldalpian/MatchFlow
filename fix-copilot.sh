#!/bin/bash
# This script removes the Copilot co-authorship from your commits

# Create a temporary script that removes the Copilot line
cat > /tmp/edit_commit_msg.sh << 'EOF'
#!/bin/bash
sed -i '/Co-authored-by: Copilot/d' "$1"
EOF
chmod +x /tmp/edit_commit_msg.sh

# Run the filter with your temp script
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --msg-filter /tmp/edit_commit_msg.sh -- --all

# Force push to update GitHub
git push --force

# Cleanup
rm /tmp/edit_commit_msg.sh

echo "✅ Done! Copilot has been removed from your contributors."
