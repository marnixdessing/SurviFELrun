export AWS_PROFILE=personal
aws s3 sync /Users/marnix/Development/Personal/SurviFELrun/dist s3://survifelrun-stack-websitebucketb3e12673-yvchpzdvgp2k/

# Upload without .html extension for making normal url paths
for file in /Users/marnix/Development/Personal/SurviFELrun/dist/*.html; do
    if [[ -f "$file" ]]; then
        filename=$(basename "$file" .html)
        aws s3 cp  --content-type text/html "$file" "s3://survifelrun-stack-websitebucketb3e12673-yvchpzdvgp2k/$filename"
        
        if [[ $? -eq 0 ]]; then
            echo "Successfully uploaded $file"
        else
            echo "Failed to upload $file"
        fi
    fi
done

echo "Upload process completed."