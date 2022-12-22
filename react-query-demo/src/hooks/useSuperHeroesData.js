import { useQuery, useMutation, useQueryClient } from 'react-query'
// import axios from 'axios'
import { request } from '../utils/axios-utils'

const fetchSuperHeroes = () => {
  // return axios.get('http://localhost:4000/superheroes')
  return request({ url: '/superheroes' })
}

export const useSuperHeroesData = (onSuccess, onError) => {
  return useQuery('super-heroes', fetchSuperHeroes, {
    // cacheTime: 5000, // 查询缓存时间（默认5分钟)，该时间段内再次请求，isLoading依然为false，只有isFetching会变化
    staleTime: 30000, // 陈旧时间(默认为0),30s后状态由fresh变为stale，在这30s之内，再次切换到RQ Super Heroes，不会发起网络请求
    // refetchOnMount: false,
    // refetchOnWindowFocus: false,
    // refetchOnWindowFocus: 'always',
    onSuccess,
    onError,
    // select: data => {
    //   const superHeroNames = data.data.map(hero => hero.name)
    //   return superHeroNames
    // }
  })
}

const addSuperHero = hero => {
  // return axios.post('http://localhost:4000/superheroes', hero)
  return request({ url: '/superheroes', method: 'post', data: hero })
}

export const useAddSuperHeroData = () => {
  const queryClient = useQueryClient()

  return useMutation(addSuperHero, {
    // onSuccess: data => {
    //   /** Query Invalidation Start */
    //   // queryClient.invalidateQueries('super-heroes')
    //   /** Query Invalidation End */

    //   /** Handling Mutation Response Start */
    // queryClient.setQueryData('super-heroes', oldQueryData => {
    //   return {
    //     ...oldQueryData,
    //     data: [...oldQueryData.data, data.data]
    //   }
    // })
    //   /** Handling Mutation Response Start */
    // },
    /**Optimistic Update Start */
    onMutate: async newHero => {
      await queryClient.cancelQueries('super-heroes')
      const previousHeroData = queryClient.getQueryData('super-heroes')
      queryClient.setQueryData('super-heroes', oldQueryData => {
        return {
          ...oldQueryData,
          data: [
            ...oldQueryData.data,
            { id: oldQueryData?.data?.length + 1, ...newHero },
          ],
        }
      })
      return { previousHeroData }
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData('super-heroes', context.previousHeroData)
    },
    onSettled: () => {
      queryClient.invalidateQueries('super-heroes')
    },
    /**Optimistic Update End */
  })
}
