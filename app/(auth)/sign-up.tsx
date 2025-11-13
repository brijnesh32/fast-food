import React, { Component } from 'react'
import { Text, View ,Button} from 'react-native'
import { Route } from 'expo-router'

export class Signup extends Component {
  render() {
    return (
      <View>
        <Text>loginin</Text>
        <Button title='Sign In' onPress={()=>router.push( href:'/sign-in')}/>
      </View>
    )
  }
}

export default Signup