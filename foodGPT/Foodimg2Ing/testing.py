import google.generativeai as genai

genai.configure(api_key="AIzaSyDKvPGbsuuzq0SYJ4Xf8GVlG1CmEpsHK2s")

model = genai.GenerativeModel("gemini-2.5-flash")

response = model.generate_content("Hello! Test message.")
print(response.text)