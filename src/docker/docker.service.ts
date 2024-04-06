import * as Docker from 'dockerode';
import { Inject, Injectable } from '@nestjs/common';
import { DOCKER_NOT_RUNNING } from './docker.constants';

@Injectable()
export class DockerService {

    constructor(@Inject('DOCKER_SERVICE') private docker: Docker) {}

    public async checkImgUp(img: string): Promise<void> {
        try {

            await this.checkDocker();

            const isImgUp = await this.checkImgRunning(img);

            if (!isImgUp) {
                return await this.startImg(img);
            }

        } catch (e) {

            throw e;

        }
    }

    public async checkImgRunning(img: string): Promise<boolean> {
        try {

            const runningImages = await this.getRunningContainers();

            return runningImages.some((image: Docker.ContainerInfo) => image.Image == img);

        } catch (e) {

            throw e;

        }
    }

    public async checkDocker(): Promise<boolean> {
        try {

            const dockerRun = await this.isDockerUp();

            if (!dockerRun) throw new Error(DOCKER_NOT_RUNNING);

            return dockerRun;

        } catch (e) {

            throw e;

        }
    }

    private async startImg(img: string): Promise<void> {
        try {

            const containers = await this.getAllContainers();

            const needContImg = containers.filter((container: Docker.ContainerInfo) => {

                if (container.Image == img) {
                    return container;
                }

            });

            if (!needContImg.length) throw `Нужный образ ${img} отсутствует`;

            const container = this.docker.getContainer(needContImg[0].Id);

            return await container.start();

        } catch (e) {

            throw e;

        }
    }

    private async getRunningContainers(): Promise<Docker.ContainerInfo[]> {

        return await this.docker.listContainers();

    }

    private async isDockerUp(): Promise<boolean> {
        try {

            const ping = await this.docker.ping();

            return !ping ? false : true;

        } catch (e) {

            throw e;

        }
    }

    private async getImagesList(): Promise<Docker.ImageInfo[]> {

        return await this.docker.listImages();

    }

    private async getAllContainers(): Promise<Docker.ContainerInfo[]> {

        return await this.docker.listContainers({
            all: true
        });
        
    }

    private getContainer(id: string): Docker.Container {

        return this.docker.getContainer(id);
        
    }
}