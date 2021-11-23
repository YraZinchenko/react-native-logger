import React, { useEffect } from 'react';
import { View } from 'react-native';
import { EventHandler } from '../index.js';

function Examples({}) {
    useEffect(() => {
        const logger = new EventHandler({
            enableConnectionListener: true
        }).start();

        return () => {
            logger.unSubscribeIntervalListener();
        };
    }, []);

    useEffect(() => {
        const { unSubscribeIntervalListener, unSubscribeConnectionListener } = EventHandler.start({
            enableConnectionListener: true,
            enableCheckListenerWithInterval: true,
            interval: 300000 // in milliseconds
        });

        return () => {
            unSubscribeConnectionListener();
            unSubscribeIntervalListener();
        };
    }, []);

    return (
        <View />
    );
}

export { Examples };