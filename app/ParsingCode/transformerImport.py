import openai


openai.api_key = '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'

def extract_from_html(html):
    prompt = f"Given the following HTML chunk:\n{html}\nExtract the main content and summarize it:"
    response = openai.Completion.create(
      model="text-davinci-002",  # Use an appropriate model version. Check OpenAI docs for latest.
      prompt=prompt,
      max_tokens=150
    )
    return response.choices[0].text.strip()

# Test the function
html_chunk = "<div><h1>Title</h1><p>This is a sample paragraph from the HTML content.</p></div>"
print(extract_from_html(html_chunk))