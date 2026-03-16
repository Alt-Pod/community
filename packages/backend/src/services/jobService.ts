import type { JobRepository, JobStatus } from "../repositories/jobRepository";
import { inngest } from "../inngest/client";

export class JobService {
  constructor(private jobRepository: JobRepository) {}

  async createJob(
    type: string,
    input: Record<string, unknown> = {},
    metadata: Record<string, unknown> = {},
    opts?: { parentJobId?: string; userId?: string }
  ) {
    const job = await this.jobRepository.create({
      type,
      input,
      metadata,
      parentJobId: opts?.parentJobId,
      userId: opts?.userId,
    });

    await inngest.send({
      name: "job/started",
      data: {
        jobId: job.id,
        type,
        input,
        metadata,
      },
    });

    return job;
  }

  async getByUserId(userId: string, filters?: { status?: JobStatus; type?: string }) {
    return this.jobRepository.findByUserId(userId, filters);
  }

  async getJob(id: string) {
    return this.jobRepository.findById(id);
  }

  async findJobs(filters: {
    type?: string;
    status?: JobStatus;
    metadataKey?: string;
    metadataValue?: string;
  }) {
    if (filters.metadataKey && filters.metadataValue) {
      return this.jobRepository.findByMetadata(
        filters.metadataKey,
        filters.metadataValue,
        { status: filters.status, type: filters.type }
      );
    }
    if (filters.type) {
      return this.jobRepository.findByType(filters.type, { status: filters.status });
    }
    return [];
  }

  async updateProgress(id: string, step: string, progress: Record<string, unknown> = {}) {
    await this.jobRepository.updateStatus(id, "running", { currentStep: step, progress });
  }

  async markRunning(id: string, inngestRunId?: string) {
    await this.jobRepository.updateStatus(id, "running", { inngestRunId });
  }

  async markCompleted(id: string, output: Record<string, unknown>) {
    await this.jobRepository.markCompleted(id, output);
  }

  async markFailed(id: string, error: string) {
    await this.jobRepository.markFailed(id, error);
  }
}
