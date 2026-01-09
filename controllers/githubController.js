import GitHubAPI from "../helpers/githubApi.js";
import GithubOrganization from "../models/GithubOrganization.js";
import GithubRepo from "../models/GithubRepo.js";
import GithubCommit from "../models/GithubCommit.js";
import GithubPull from "../models/GithubPull.js";
import GithubIssue from "../models/GithubIssue.js";
import GithubUser from "../models/GithubUser.js";
import GithubIntegration from "../models/GithubIntegration.js";

let apiClient = null;

export default class GitHubController {
  static async getApi() {
    if (apiClient) return apiClient;

    const integration = await GithubIntegration.findOne({
      integrationStatus: "active",
    });

    if (!integration) {
      throw new Error("GitHub integration not active");
    }

    apiClient = new GitHubAPI(integration.oauthToken);

    return apiClient;
  }

  static async fetchAll(fetchFn) {
    let page = 1;

    const allData = [];

    const perPage = 100;

    while (true) {
      const data = await fetchFn(page, perPage);

      if (data.length === 0) break;

      allData.push(...data);

      if (data.length < perPage) break;

      page++;
    }

    return allData;
  }

  static async save(Model, data, uniqueKey) {
    for (const item of data) {
      await Model.updateOne(
       
        { 
          [uniqueKey]: item[uniqueKey] 
        },

        { 
          $set: { 
            ...item, 
            syncedAt: new Date() 
          } 
        },
        { 
          upsert: true 
        }
      );
    }
  }

  static async fetchOrganizations() {
    const api = await this.getApi();

    let orgs = await api.getOrganizations();

    if (orgs.length === 0) {
      try {
        
        const org = await api.getOrganizationByName("Rehman-organizattion"); // if not found then fetch by name

        if (org) orgs = [org];
      } 
      catch (error) {
        throw new Error(error);
      }
    }

    await this.save(GithubOrganization, orgs, "id");

    return orgs;
  }

  static async fetchRepos(orgName) {
    const api = await this.getApi();

    const repos = await api.getOrganizationRepos(orgName);

    await this.save(GithubRepo, repos, "id");

    return repos;
  }

  static async fetchCommits(owner, repo) {
    const api = await this.getApi();

    const commits = await this.fetchAll((page) =>
      api.getRepoCommits(owner, repo, page)
    );

    await this.save(GithubCommit, commits, "sha");

    return commits;
  }

  static async fetchPulls(owner, repo) {
    const api = await this.getApi();

    const pulls = await this.fetchAll((page) =>
      api.getRepoPulls(owner, repo, page)
    );

    await this.save(GithubPull, pulls, "id");

    return pulls;
  }

  static async fetchIssues(owner, repo) {
    const api = await this.getApi();

    const issues = await this.fetchAll((page) =>
      api.getRepoIssues(owner, repo, page)
    );

    await this.save(GithubIssue, issues, "id");

    return issues;
  }

  static async fetchUsers(orgName) {
  try {
    const api = await this.getApi();

    let users =
      await this.fetchAll((page, perPage) =>
        api.getOrganizationMembers(orgName, page, perPage)
      ) ||
      await this.fetchAll((page, perPage) =>
        api.getOrganizationPublicMembers(orgName, page, perPage)
      );

    if (!users.length) {
      const org = await api.getOrganizationByName(orgName);
      users = org?.owner ? [org.owner] : [];
    }

    if (users.length) {
      await this.save(GithubUser, users, "id");
    }

    return users;
  } catch {
    return [];
  }
}


  static async resyncAllData() {
    const orgs = await this.fetchOrganizations();

    for (const org of orgs) {
      const repos = await this.fetchRepos(org.login);
      
      await this.fetchUsers(org.login);

      for (const repo of repos) {
      
        const [owner, repoName] = repo.full_name.split("/");
      
        await this.fetchCommits(owner, repoName);
      
        await this.fetchPulls(owner, repoName);
      
        await this.fetchIssues(owner, repoName);
      }
    }

    const integration = await GithubIntegration.findOne({
      integrationStatus: "active",
    });
    if (integration) {
      integration.lastSyncTimestamp = new Date();
      await integration.save();
    }

    return { message: "GitHub data sync complete" };
  }
}
