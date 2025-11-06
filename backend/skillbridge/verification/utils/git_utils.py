import requests

def fetch_github_profile(username):
    """
    Fetch basic GitHub user data and repos.
    Returns a dict with prof info and repo details.
    """
    base_url = "https://api.github.com/users/{}".format(username)
    
    # fetch profile info
    profile_resp = requests.get(base_url)
    if profile_resp.status_code != 200:
        raise Exception(f"Failed to fetch profile: {profile_resp.text}")
    profile_data = profile_resp.json()

    # fetch repo info
    repos_resp = requests.get(profile_data["repos_url"])
    if repos_resp.status_code != 200:
        raise Exception(f"Failed to fetch repos: {repos_resp.text}")
    repos_data = repos_resp.json()

    repo_list = []
    for repo in repos_data:
        repo_list.append({
            "name": repo["name"],
            "description": repo["description"],
            "language": repo["language"],
            "stars": repo["stargazers_count"],
            "url": repo["html_url"]
        })

    return {
        "username": profile_data["login"],
        "name": profile_data.get("name", ""),
        "bio": profile_data.get("bio", ""),
        "public_repos": profile_data["public_repos"],
        "repos": repo_list
    }

