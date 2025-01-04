"use client"

import React, {useState, useRef, useEffect} from 'react'
// @ts-ignore
import {LuckyWheel} from '@lucky-canvas/react'

import {queryRaffleAwardList, randomRaffle} from '@/apis'
import {RaffleAwardVO} from "@/types/RaffleAwardVO";


export function LuckWheelPage() {

    const queryParams = new URLSearchParams(window.location.search);
    const strategyId = Number(queryParams.get('strategyId'));
    const [prizes, setPrizes] = useState([{}])
    const myLucky = useRef()


    const [blocks] = useState([
        { padding: '10px', background: '#869cfa', imgs:[{src:"https:bugstack.cn/images/system/blog-03.png"}] }
    ])
    // const [prizes] = useState([
    //     { background: '#e9e8fe', fonts: [{ text: '0' }] },
    //     { background: '#b8c5f2', fonts: [{ text: '1' }] },
    //     { background: '#e9e8fe', fonts: [{ text: '2' }] },
    //     { background: '#b8c5f2', fonts: [{ text: '3' }] },
    //     { background: '#e9e8fe', fonts: [{ text: '4' }] },
    //     { background: '#b8c5f2', fonts: [{ text: '5' }] },
    // ])
    const [buttons] = useState([
        { radius: '40%', background: '#617df2' },
        { radius: '35%', background: '#afc8ff' },
        {
            radius: '30%', background: '#869cfa',
            pointer: true,
            fonts: [{ text: '开始', top: '-10px' }]
        }
    ])

    // 查询奖品列表
    const queryRaffleAwardListHandle = async () => {
        const result = await queryRaffleAwardList(strategyId);
        const {code, info, data} = await result.json();
        if (code != "0000") {
            window.alert("获取抽奖奖品列表失败 code:" + code + " info:" + info)
            return;
        }

        // 创建一个新的奖品数组
        const prizes = data.map((award: RaffleAwardVO, index: number) => {
            const background = index % 2 === 0 ? '#e9e8fe' : '#b8c5f2';
            return {
                background: background,
                fonts: [{id: award.awardId, text: award.awardTitle, top: '15px'}]
            };
        });

        // 设置奖品数据
        setPrizes(prizes)
    }

    useEffect(() => {
        queryRaffleAwardListHandle().then(r => {
        });
    }, [])

    // 调用随机抽奖
    const randomRaffleHandle = async () => {
        const result = await randomRaffle(strategyId);
        const {code, info, data} = await result.json();
        if (code != "0000") {
            window.alert("获取抽奖奖品列表失败 code:" + code + " info:" + info)
            return;
        }
        // return data.awardId;
        // 为了方便测试，mock 的接口直接返回 awardIndex 也就是奖品列表中第几个奖品。
        return data.awardIndex ? data.awardIndex : prizes.findIndex(prize =>
            //@ts-ignore
            prize.fonts.some(font => font.id === data.awardId)
        ) + 1;
    }



    return <div>
        <LuckyWheel
            ref={myLucky}
            width="300px"
            height="300px"
            blocks={blocks}
            prizes={prizes}
            buttons={buttons}
            onStart={() => { // 点击抽奖按钮会触发star回调
                myLucky.current.play()
                setTimeout(() => {
                    randomRaffleHandle().then(prizeIndex=>{
                        myLucky.current.stop(prizeIndex)
                    })

                }, 2500)
            }}
            onEnd={prize => { // 抽奖结束会触发end回调
                alert('恭喜你抽到【' + prize.fonts[0].text + '】奖品ID【' + prize.fonts[0].id + '】')
            }}
        />
    </div>
}