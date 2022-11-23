from celery import Celery

celery = Celery("tasks", broker="amqp://", backend="redis://")

@celery.task(name='tasks.mfcc')
def mfcc(x, y):
    return x + y
