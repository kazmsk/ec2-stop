//definition library
const aws = require('aws-sdk');

//difinition variables
const ec2 = new aws.EC2();

exports.handler = async (event) => {
  // definition of logger
  const logger = new Logger();

  // event parameters
  logger.info('Event parameters');
  logger.info(event);

  // check instance exists
  const reservations = await describeInstance().catch(onError);
  if (reservations.length === 0) {
    logger.info('Instance none');
    return 'End function';
  } else {
    // stop instance
    logger.info('stop instance');
    for (let reservation of reservations) {
      const instanceId = reservation.Instances[0].InstanceId;
      logger.debug(instanceId);
      await stopInstances(instanceId).catch(onError);
    }
    logger.info('Completion stop instace');
    return 'End function';
  }
};

// check instance exists
function describeInstance() {
  return new Promise((resolve, reject) => {
    const params = {
      Filters: [
        {
          Name: 'tag-key',
          Values: ['AutoStop']
        },
        {
          Name: 'tag-value',
          Values: ['true']
        }
      ]
    };
    ec2.describeInstances(params, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response.Reservations);
      }
    });
  });
}

// stop instance
function stopInstances(instanceId) {
  return new Promise((resolve, reject) => {
    const params = {
      InstanceIds : [instanceId]
    };
    ec2.stopInstances(params, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(null);
      }
    });
  });
}

function onError(error) {
  console.log(error);
  throw error;
}

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL;
  }

  info(message) {
    const format = {
      logLevel: 'INFO',
      message: message
    };
    console.log(JSON.stringify(format));
  }

  debug(message) {
    const format = {
      logLevel: 'DEBUG',
      message: message
    };
    if (this.logLevel == 'DEBUG') {
      console.log(JSON.stringify(format));
    }
  }

  error(message) {
    const format = {
      logLevel: 'ERROR',
      message: message
    };
    console.log(JSON.stringify(format));
  }
}