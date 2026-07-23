from fastapi import FastAPI

app = FastAPI(title="fitsens API",version="1.0")


@app.get("/health")
def health_check():
    return {"status":"okay"}


