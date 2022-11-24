from celery import Celery

celery = Celery("tasks", broker="amqp://", backend="redis://")

@celery.task(name='tasks.mfcc')
def mfcc(url):
    return ["wdnjauulI8Q"]
